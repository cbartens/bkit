Verdict: PASS

<!-- verdict:end -->

<!-- Note: Canonical plan path on promotion: `docs/plans/202605/141-cloud-app-plan.md`. This draft lives at `docs/plans/202605/logs/141-cloud-app/plan-v1-draft.md`. {YYYYMM} = 202605. -->

# bkit-cloud rebuild on the Claude GitHub App Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

bkit's cloud-agent capability on GitHub-tracker repos has never run end-to-end: a live dispatch proved `claude-code-action@v1` cannot boot because `bkit-cloud.yml` lacks `id-token: write` and was designed to lean on `github.token` instead of the Claude GitHub App (D1). The same live trace surfaced two more defects — bookkeeping commits without `[skip ci]` fire the CI auto-router mid-build (D2), and an incoherent concurrency key lets a dispatched build race the auto-ship it triggers (D3). The authoritative FINAL SCOPE comment (#141 `issuecomment-4542046671`) rebuilds the whole capability **on** the Claude GitHub App (OIDC identity) rather than around it, splits the opt-in `cloud` module into `cloud=claude` / `cloud=cursor` variants constrained by tracker, moves the CI auto-route gate into a two-tier YAML guard (`bkit [auto route]` marker + in-job `bkit:auto` re-check), and migrates Linear's bare `Auto` label to `bkit:auto`. This change MUST land together with #184's single shared HEAD-subject assertion, which becomes the source of truth for the commit-tag contract that D2 implements.

**Success Criteria:**

- A live dispatch reaches a Claude turn: `claude-code-action@v1` authenticates as the Claude App via OIDC (`id-token: write` + App installed) on the `bkit-cloud.yml` CI path, gated by a coherent two-tier CI route and a single FID-derived concurrency key. (The `claude.yml` `@claude` mention path keeps its own existing `claude_code_oauth_token` auth — both surfaces _act as_ the Claude App, but they do NOT share one token input; see DECISION-A.)
- `cloud=claude` requires `tracker=github` and `cloud=cursor` requires `tracker=linear` (symmetric hard-error on mismatch); switching an established tracker hard-blocks without `--force`; all driven off `package.json` recorded state.
- The `bkit [auto route]` marker is the sole gate for zero-runner-minute CI routing, `bkit:auto` is consistent across every tracker, and all bkit tests stay green.

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

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `cloud=claude` renders `bkit-cloud.yml` with `id-token: write` + no Linear branch + no `github.token`-handles-everything framing | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `renderCloudWorkflow` accepts only `cloud=claude`/`github` shape; Linear render branch removed | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `--cloud=claude` requires `tracker=github`; `--cloud=cursor` requires `tracker=linear`; mismatch hard-errors symmetrically | Unit (Vitest) | `.agents/scripts/bkit-cli.test.ts` (+ install enforcement test) |
| Switching an established tracker hard-blocks without `--force`; first-set is free | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` (or install-level test) |
| `cloud=cursor` ships `.cursor/Dockerfile` + `environment.json`; `cloud=claude` does not orphan Cursor config | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit-cloud-setup` advisory states App + `/install-github-app` required (optional→required); `github.token`-only framing deleted; no bare `Auto` in advisory text | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit-postinstall.ts` cloud advisories no longer couple `LINEAR_API_KEY` to `bkit-cloud.yml`; GitHub-only secret set for `cloud=claude` | Unit (Vitest) | `.agents/scripts/bkit-postinstall.ts` test / `bkit-modules.integration.test.ts` |
| `bkit check` asserts `cloud=claude` config consistency (workflow has `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` / doctor test |
| Two-tier CI gate: job skipped without `bkit [auto route]` (negative) AND fires-to-dispatch when marked-commit-is-HEAD + `bkit:auto` present (positive); in-job `bkit:auto` re-check kill switch; `{ISSUE}` via SHARED-DERIV | Manual/YAML review + render/grep assertion (no unit harness for GHA `if:`) | `.github/workflows/bkit-cloud.yml` + template |
| Concurrency key reconciled to one FID-derived token across dispatch + CI surfaces | Unit (Vitest, render assertion) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `worktree-setup` / `create-pr` carry `bkit [skip ci]`; close-workflow + debug re-trigger are loud + marked | Doc/workflow review (no executable test) | `.agents/workflows/bkit-build.md`, `.agents/workflows/bkit-debug.md` |
| `Auto` → `bkit:auto` migrated in preflight hooks | Integration (Vitest, rendered-file assertion via real tool path) | preflight render / `bkit-modules.integration.test.ts` |
| Dry-run parity for `cloud=claude` and `cloud=cursor` | Integration (Vitest) | `.agents/scripts/bkit-dry-run-parity.integration.test.ts` |
| Manifest entries for `cloud=claude` vs `cloud=cursor` variants | Unit (Vitest) | manifest test (existing suite) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

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
> - New `package.json` field: **`bkit.cloud` (`"claude" | "cursor"`)** recording the cloud variant — distinct from the existing `bkit.cloudAgents` ("enabled"/"none") presence signal. **LOCKED (DECISION-C):** field name is `bkit.cloud`; `bkit.cloudAgents` keeps its presence-signal meaning so `runPostInstallCheck` (reads `cloudAgents`) is unaffected. FINAL SCOPE decision 4 calls it the "new cloud-variant field"; this resolves it. Human may override at Gate 1, but the runbook assumes `bkit.cloud` and does not branch.
> - New commit marker: `bkit [auto route]` (literal, `bkit` outside the brackets, direction-neutral; mirrors `bkit [skip ci]`).
> - New workflow grant: `id-token: write` in `bkit-cloud.yml`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

> [!IMPORTANT]
> **Decision points resolved during review (recommended calls — flag to the human at Gate 1; proceed on these unless overridden):**
>
> - **DECISION-A — `claude.yml` vs `bkit-cloud.yml` auth model (resolves R1-C1 / R3-C1a / R2-opt).** The two surfaces authenticate via **different** mechanisms by design and MUST NOT be reconciled into one input: `claude.yml` (the `@claude` mention path) keeps its existing `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` + `id-token: write` (Claude-subscription OAuth, App-generated workflow); `bkit-cloud.yml` (the CI auto-route path) gains `id-token: write` and keeps `ANTHROPIC_API_KEY`. Both _run as the Claude App_ at the identity level; "coherent" means "both surface as the App," NOT "same token surface." A builder MUST NOT migrate `claude.yml` onto `ANTHROPIC_API_KEY` or vice-versa.
> - **DECISION-B — `claude.yml` is bkit-repo-only; `@claude /bkit-<phase>` is NOT a shipped consumer trigger this cycle (resolves R1-C2 / R2-opt / R3-C1b).** `Glob **/claude.yml` confirms there is NO `.agents/templates/**/claude.yml` — `claude.yml` is generated by the Claude GitHub App's `/install-github-app`, not by `bkit install`. **Recommended call: do NOT ship a bkit `claude.yml` template this cycle** (FINAL SCOPE lists no template surface and shipping one would expand scope + duplicate the App's generated workflow). Consequence: the consumer-facing `@claude /bkit-<phase>` capability rides entirely on (a) the consumer running `/install-github-app` (which generates their own `claude.yml` that already fires on any `@claude` comment and passes the typed command through as the prompt) and (b) the `bkit-cloud-setup` advisory (T1.7) directing them to do so. Block 4's `claude.yml` edits are **dogfood/bkit-repo-only** and do NOT reach consumers via `bkit install`; checklist item (10) is therefore bkit-repo-verifiable + advisory-covered, not consumer-shipped. (If the human instead wants a shipped template, that is a scope addition handled in a follow-up, not here.)
> - **DECISION-C — `package.json` cloud-variant field name = `bkit.cloud` (resolves R1-O1 / R3-opt).** Lock `bkit.cloud` (`"claude" | "cursor"`) as a field distinct from the existing `bkit.cloudAgents` presence signal (`"enabled" | "none"`, `bkit-manifest.ts:127`). `bkit.cloudAgents` retains its presence-signal meaning (so `runPostInstallCheck`, which reads `cloudAgents`, is unaffected); `bkit.cloud` records the variant. The `bkit check` consistency assertion (T1.8) reads `bkit.cloud`. This is on the human-confirmation surface (Breaking Changes); the runbook assumes `bkit.cloud` and MUST NOT branch on an undecided name.
> - **DECISION-D — manifest split, not variant-gated emission (resolves R1-O3 / R2-opt / R3-opt).** Split `CLOUD_MANIFEST` so `cloud=claude` owns `bkit-cloud.yml` (`byte-equal-text`) + `cloud-bootstrap.sh`, and `cloud=cursor` owns `.cursor/Dockerfile` (`markered-text`) + `environment.json` (or tag each manifest entry with its owning variant). Uninstall walks the manifest and MUST remove only the recorded variant's files — a single manifest with variant-gated _emission_ but unconditional _uninstall listing_ would orphan the unused variant's files on `uninstall`. The split makes uninstall mechanical.
> - **DECISION-E — re-home the kill-switch label propagation (resolves R3-4).** Moving the opt-in gate into YAML (T2.6) must NOT silently drop the orchestrator's kill-switch _propagation_ (removing the `bkit:auto` PR label, `bkit-cloud.md:193-196`). **Recommended call: re-home the label removal into the YAML job's no-op/kill-switch branch** (preserves behaviour). Alternative (only if the maintainer prefers): explicitly drop it and document consumer-manual cleanup. Must be an explicit decision in T2.6, never a silent omission.

- **Rejected (D1, pre-FINAL-SCOPE):** bypass the App by passing `github.token` as the action's own auth (`github_token` input). Superseded by Comment 7 / FINAL SCOPE decision 1 — build on the App (OIDC identity, PR/issue context, comment posting, `@claude` triggers) rather than around it. Reinventing those is wasted surface and breaks `@claude` follow-ups.
- **Rejected:** runtime App-presence detection (probe whether the App is installed from a user PAT). Not reliably detectable from a user PAT (FINAL SCOPE decision 5). Use `package.json`-recorded state + advisory + `bkit check` consistency instead; the failure mode if skipped is the loud OIDC boot error.
- **Rejected:** auto-derive `--cloud` variant from tracker. FINAL SCOPE decision 3 requires explicit `--cloud=claude|cursor`; the tracker constrains the variant (mismatch = hard error) but does not select it.
- **Future:** broaden App trigger surfaces beyond `issue_comment` (`pull_request_review_comment`, etc.) once the primary `@claude /bkit-<phase>` path is verified live (Comment 8 lists them). Bare issue assignment as a phase carrier is explicitly out of scope.

## Out of Scope

- Linear → `repository_dispatch` → `bkit-cloud` bridge (DROPPED in #119/Comment 1; Linear cloud routing is Cursor-native).
- Bare issue assignment as a phase-carrier trigger (FINAL SCOPE decision 6).
- Linear-side label migration in a live Linear workspace (bkit ships the renamed snippets/hooks; relabelling existing Linear issues is a consumer action).
- The live dispatch runtime-verification (requires a real GitHub Actions dispatch + Claude App install) — captured as a human-gated post-merge Manual Verification item, not automatable in-plan.

## Merge Method

**Merge method: always squash.** This plan MUST NOT propose `rebase` or `merge-commit`. `bkit-ship.md` is hardcoded to `gh pr merge --squash --delete-branch --body ""`. #141 and #184 must land **together** — implement both on a single branch / single squashed PR (the shared HEAD-subject assertion in #184 is invoked by D2's build-path changes; splitting them strands the contract). Do NOT decompose into separate PRs.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `renderCloudWorkflow` Linear render branch (`isLinear` mcp/secret substitution) `.agents/scripts/bkit-modules.ts:1910-1921` | GitHub-only render (drop `@@CLOUD_TRACKER_*@@` Linear paths; add `id-token`) | DELETE | `bkit-cloud.yml` is GitHub-tracker-only; the Linear branch is vestigial (FINAL SCOPE "Vestigial Linear branch removed"). |
| `bkit-cloud.yml:23-25` "`github.token` handles all repo git/gh; no App" rationale (canonical + template; line 22 is the tracker-conditional sentence, framing is 23-25 per R3) | App-auth framing (`id-token: write` + App required) | DELETE | FINAL SCOPE decision 1: delete the framing; commits/PRs/comments appear as the App. |
| `bkit-modules.ts:2075` "Do NOT add `GH_BKIT_TOKEN` … github.token" advisory line | App-required advisory text | DELETE | Same as above; advisory must state App + `/install-github-app` required (decision 2). |
| Bare `Auto` label in `.agents/templates/.claude/hooks/preflight.sh:8,109-111` + `.agents/templates/.cursor/hooks/preflight.sh:8,96-98` | `bkit:auto` | DELETE | Label convention: `bkit:` prefix on every tracker (FINAL SCOPE Labels row; migrate bare `Auto`). |
| Bare `Auto` in `bkit-modules.ts` advisory text — `bkit-cloud-setup` strings at `:2051` ("reads the `Auto` opt-in label"), `:2054` ("labelled `Auto` in Linear"), `:2055` ("carries the `Auto` label") | `bkit:auto` (fix-in-place) OR removed-with-branch | DELETE | R3-2: consumer-facing advisory shipped by bkit must say `bkit:auto` for consistency with the migrated hooks that check `bkit:auto`. These live in the `isLinearCloud` branch — reconcile with the cloud-split (cursor=linear): if the split removes the branch wholesale, the strings go with it; otherwise fix them in place. Either way they MUST NOT survive saying bare `Auto`. |
| Bare `--cloud` flag (value-less) `.agents/scripts/bkit-cli.ts` | `--cloud=claude\|cursor` value-bearing flag | DELETE | FINAL SCOPE decision 3: explicit variant, tracker-constrained. |

> [!CAUTION]
> Each `DELETE` row is mirrored in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook`.

## Security & Privacy

> bkit is a tooling repo, not the app-gether-life app — the template's API-route/RLS/Zod rows do not apply. Relevant rows:

- [x] **Webhook / event trigger** — `bkit-cloud.yml` `workflow_run` and `claude.yml` `issue_comment` are GitHub-native events; the two-tier gate (`bkit [auto route]` marker + in-job `bkit:auto` re-check) is the trust boundary. No raw webhook secret to verify (GitHub signs events).
- [x] **New secret/env var** — `ANTHROPIC_API_KEY` (existing) is the only required secret; `id-token: write` is an OIDC grant, not a stored secret. No new stored secret. `GH_BKIT_TOKEN` must NOT be added to `bkit-cloud.yml` (package-install scoped, no consumer-repo access).
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
- [ ] **Prerequisite Plans:** **#184** (shared HEAD-subject assertion) — MUST land together on this branch. No separate prior plan to execute; coordinate the two in one PR.

### Conditional (verify only when applicable)

- [ ] **Architecture & UI** _(workflow/CLI topology)_: Validate against `.agents/docs.md` Full Catalog roles (`cloud.md` = cloud env SoT; `trackers.md` = per-tracker installer snippets; `deployments.md` = CI/commit-tag rules). Keep `cloud.md`/`deployments.md`/`knowledge.md` role separation (deployments = rules, knowledge = incidents) per repo memory.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — bkit is a tooling repo with no application database. The only persisted state is `package.json` `bkit.*` fields (config, not a DB schema).

### Data Schema Changes

None (no DB). Config-field changes are tracked under `Architecture & Component Changes` (`bkit.cloud` field) and `Documentation Updates`.

## Architecture & Component Changes

Grouped by FINAL-SCOPE internal-ordering block. **CRITICAL:** All `[MODIFY]` files below were verified to exist; cited line numbers were re-checked against current `dev` and differ from the FINAL-SCOPE comment's earlier-commit numbers (noted inline).

### Block 1 — D1 + App auth + cloud-module split + tracker/cloud enforcement + docs/advisory flip

#### [MODIFY] `.agents/templates/.github/workflows/bkit-cloud.yml`

- **Existence Check:** Exists (151 lines).
- Add `id-token: write` to the `permissions:` block (currently lines 67-73: contents/pull-requests/issues/actions — no id-token).
- Delete the "`github.token` handles all repo git/gh access … no App" framing (lines 23-25 of the comment header; line 22 is the tracker-conditional sentence — R3 line fix).
- Reconcile the `concurrency:` key (line 64) to a single FID-derived token across dispatch + CI surfaces (D3 — see Block 3).
- Add the two-tier CI auto-route gate (Block 2): free-tier job `if: contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')` + in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` (`{ISSUE}` derived per SHARED-DERIV — see Block 2 two-tier-gate task). Wrap the YAML gate logic inside `bkit:start`/`bkit:end` markers (Comment 7 gate-placement rule).
- Remove the `@@CLOUD_TRACKER_*@@` Linear sentinels (workflow becomes GitHub-only).

#### [MODIFY] `.github/workflows/bkit-cloud.yml` (this repo's rendered copy)

- **Existence Check:** Exists (150 lines — the rendered, Linear-free github variant).
- Mirror every template change above. This is the canonical Tier-1 file regenerated by `bkit install`; keep it byte-identical to the rendered template for `tracker=github`.

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** Exists.
- `renderCloudWorkflow` (lines 1910-1921): **DELETE** the `isLinear` branch (mcp/secret/secretEnv substitution). Render GitHub-only; ensure `id-token: write` is present in output. Decide whether `@@CLOUD_TRACKER_*@@` sentinels are removed from the template entirely (preferred) or rendered to empty.
- `runCloudModule` (lines 1923-2084): **SPLIT** into `cloud=claude` vs `cloud=cursor` behaviour:
  - `cloud=claude` → ship `bkit-cloud.yml` + `cloud-bootstrap.sh`; require `tracker=github` + App.
  - `cloud=cursor` → ship `.cursor/Dockerfile` + `environment.json`; require `tracker=linear`.
  - Record the variant via a new `bkit.cloud` field (set alongside the existing `setConsumerBkitField("cloudAgents", "enabled", …)` at line 2013).
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
- Add a `bkit.cloud` field convention note (mirror `CloudAgents` block lines 113-138).

#### [MODIFY] `bkit check` / consistency assertion (in `bkit-install.ts` Phase-3 post-install / advisory replay, or doctor path)

- **Existence Check:** Post-install checks run for both install AND check (`bkit-install.ts` ~line 988). Add a `cloud=claude` config-consistency assertion: when `bkit.cloud === "claude"` (or `bkit-cloud.yml` present) → assert workflow has `id-token: write`, the `ANTHROPIC_API_KEY` note, and the App advisory is surfaced. Fail `bkit check` (exit 1) on inconsistency.

#### [MODIFY] `.agents/cloud.md`

- **Existence Check:** Exists.
- Matrix (line 23) + path E (line 30): flip the App from "optional / experimental" to **base requirement** for `cloud=claude`.
- § Post-CI auto-routing (lines 329-389): replace the `github.token` framing (lines 367, 369) with App-auth; document the two-tier `bkit [auto route]` gate; document `--cloud=claude|cursor`.
- § Required GitHub repo secrets (lines 360-369): keep `ANTHROPIC_API_KEY`; remove the "No App / github.token" claims; add `id-token: write` + App requirement.
- Alignment-guarantees note (line 47) already references the `Auto`→`bkit:auto` migration — finalise the wording once migrated.

#### [MODIFY] `.agents/scripts/bkit-postinstall.ts` (R3-3 — downstream readers of the deleted Linear render branch)

- **Existence Check:** Exists. `buildCloudSetupAdvisory` (line 803), `buildCloudDashboardsAdvisory` (line 849), `buildCloudSecretsAdvisory` (line 895) all branch on `tracker === "linear"` to add `LINEAR_API_KEY` to the `bkit-cloud.yml` secret set and to phrase post-CI auto-routing around a Linear-flavoured `bkit-cloud.yml`.
- These are direct downstream readers of the surface being deleted (Decision 1 / "Vestigial Linear branch removed; `bkit-cloud.yml` is GitHub-only"): a Linear `bkit-cloud.yml` can no longer exist, so the `tracker==="linear"` branches describe an impossible state and `buildCloudSecretsAdvisory` would tell a (mis-recorded) consumer to set `LINEAR_API_KEY` that the GitHub-only workflow never reads (classic "schema column dropped, downstream reader not updated" regression).
- **Reconcile all three with the GitHub-only model + the `cloud=claude`/`cloud=cursor` split:** `bkit-cloud.yml`-related advisory text is `cloud=claude`/`tracker=github` only; `LINEAR_API_KEY`/`.cursor`-related guidance belongs to the `cloud=cursor`/`tracker=linear` path (which ships `.cursor/`, not `bkit-cloud.yml`). Drop the `tracker==="linear"` → `bkit-cloud.yml` secret coupling.

#### [MODIFY] generated `.agents/advisories.md`

- **Existence Check:** Regenerated from advisory definitions. Regenerate after the `bkit-cloud-setup` advisory edits (do NOT hand-edit; defer regen to end-of-session per repo memory — no per-edit `bkit install`).

#### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts` + `bkit-cli.test.ts` + `bkit-dry-run-parity.integration.test.ts`

- **Existing tests this change MUST update (named explicitly — R3-opt/R2-opt):**
  - Advisory asserts **lines 679-701**: `bkit-cloud-setup` action now asserts App-required + `/install-github-app`; remove `github.token` expectation; assert `bkit:auto` (not bare `Auto`) in advisory text.
  - `bkit.cloudAgents === "enabled"` assertion at **~703-710**: extend to also assert the new `bkit.cloud` variant field is recorded (`"claude"`/`"cursor"`).
  - `renderCloudWorkflow` Linear-keep regression tests at **754-762** and **787-793** (the "linear tracker keeps `LINEAR_API_KEY`" cases): **DELETE/replace** — Linear branch is removed. The 765-794 block is the broader render set; assert `id-token: write` + GitHub-only there.
  - `linear: omits install-github-app` advisory test at **~695-700**: restructure under the cloud-split (linear→cursor ships NO `bkit-cloud.yml`).
- Add cloud=claude/cursor variant + tracker-constraint + tracker-switch tests. Add `cloud=cursor` dry-run parity. Add the `bkit-postinstall.ts` advisory reconciliation test (T1.10) and the `bkit check` consistency test (T1.8).

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

### Block 4 — `@claude` / `claude.yml` trigger wiring + `Auto`→`bkit:auto` migration

#### [MODIFY] `.github/workflows/claude.yml` (bkit-repo-only — NOT shipped to consumers, DECISION-B)

- **Existence Check:** Exists (already has `id-token: write` at line 25, uses `claude_code_oauth_token` at line 37). `Glob **/claude.yml` confirms there is **NO** `.agents/templates/**/claude.yml` — this file is bkit-repo-only (the App generates each consumer's own `claude.yml` via `/install-github-app`). bkit ships NO `claude.yml` template this cycle (DECISION-B); these edits are dogfood/bkit-repo-only and do NOT reach consumers via `bkit install`.
- Wire `@claude /bkit-<phase>` dispatch as the App: `issue_comment` is the primary surface (lines 3-5). Ensure the typed command (`/bkit-design|plan|build|ship|debug`) is the phase carrier and is passed through to `claude-code-action`. The stock App `claude.yml` `if:` already fires on any `@claude` comment and passes the typed command through as the prompt — verify this holds and is documented; do NOT migrate this file's auth onto `ANTHROPIC_API_KEY` (DECISION-A: keep `claude_code_oauth_token` + `id-token: write`). Confirm bare issue assignment (line 9 `assigned`) does NOT carry a phase (out of scope as a trigger).
- Consumer coverage for `@claude /bkit-<phase>` (checklist item 10) rides on `/install-github-app` + the `bkit-cloud-setup` advisory (T1.7), NOT on a bkit-shipped workflow.

#### [MODIFY] `.agents/templates/.claude/hooks/preflight.sh` + `.agents/templates/.cursor/hooks/preflight.sh`

- **Existence Check:** Both exist.
- Migrate bare `Auto` → `bkit:auto`: `.claude/hooks/preflight.sh` lines 8, 109-111 (`,Auto,` substring match + `FAIL_REASON`); `.cursor/hooks/preflight.sh` lines 8, 96-98. (`.agents/trackers.md` already uses `bkit:auto` — verify no bare `Auto` remains there.)

#### [MODIFY] `.agents/trackers.md`

- **Existence Check:** Exists. Already uses `bkit:auto` throughout (lines 61, 78, 95, 139, 169, 181, 196, 215, 251, 274, 288). Confirm no bare `Auto` snippet remains after the hook migration; update the `bkit:auto (CI-router trigger gate)` label description (lines 78, 196) to "bkit-cloud trigger gate" if Comment 2's rename is folded in.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.agents/cloud.md` | App = base requirement (matrix line 23, path E line 30); rewrite § Post-CI auto-routing for App-auth + two-tier `bkit [auto route]` gate; `--cloud=claude\|cursor`; remove `github.token`-only framing (lines 367, 369). |
| `.agents/trackers.md` | Confirm `bkit:auto` consistency post-hook-migration; optional label-description rename (lines 78, 196). |
| `docs/deployments.md` | § "CI trigger on final workflow push" (lines 309-321): document `bkit [auto route]` as a loud HEAD token (not a skip tag), worktree-setup/create-pr now carry `[skip ci]`, the two-tier CI auto-route gate, and point the contract at #184's shared assertion. **Reconcile BOTH existing drift directions in one pass:** add `worktree-setup` to the `:321` skip-tagged list (currently absent), and fix the `:318` close-workflow description (its named commit `chore({FID}): close-workflow status trigger CI` + "drops `bkit [skip build] bkit [skip ci]`" does not match the real `bkit-build.md:947` commit, which is `chore({FID}): close-workflow` with no tags to drop). Cross-link KN-11. |
| `docs/decisions.md` | New ADR: bkit-cloud rebuilt on the Claude GitHub App (OIDC), cloud=claude/cursor split tracker-constrained, package.json-recorded enforcement, two-tier CI gate, `bkit [auto route]` marker. |
| `docs/knowledge.md` | Append incident: D1 OIDC boot failure (missing `id-token`), D2 mid-build router fire (missing `[skip ci]`), D3 concurrency race — symptom → root cause → fix. (Cross-link KN-11.) |
| `.agents/advisories.md` | Regenerate after `bkit-cloud-setup` advisory edits. |

_Remove rows with no change. `docs/decisions.md` and `docs/pending.md` already exist — append, do not recreate._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | bkit has no database. |
| **Code** | `git revert {SQUASH_SHA}` of the combined #141+#184 PR | Single squashed commit; revert restores prior `bkit-cloud.yml`, CLI, workflows, docs atomically. |
| **Risk window** | None for installed consumers until they re-run `bkit install`/`upgrade` | Shipped workflow/CLI changes only take effect on consumer re-install; live consumers on the old `--cloud` keep their existing (broken-at-boot) workflow until they upgrade. |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. Do not pause at Gates. Check off `[x]` as you go.
> **Blockers:** Do not fail silently — create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification + checkbox) before the next.
> **Ordering:** Follow the four FINAL-SCOPE blocks in order. Block 2 depends on #184; Block 2's gate depends on the marker being HEAD (Block 2 build-path tasks).

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
- [ ] **T1.5:** Split `runCloudModule` by variant + add `bkit.cloud` field; update `MODULE_REGISTRY`/`MODULE_DISPATCH_ORDER` + `bkit-manifest.ts` so `cloud=claude` ships `bkit-cloud.yml`+`cloud-bootstrap.sh` and `cloud=cursor` ships `.cursor/Dockerfile`+`environment.json`.
  - **Done when:** integration test shows `--cloud=claude` writes `bkit-cloud.yml` (not `.cursor/Dockerfile`) and `--cloud=cursor` writes `.cursor/Dockerfile`+`environment.json` (not `bkit-cloud.yml`); `package.json` `bkit.cloud` recorded (DECISION-C) AND the existing `bkit.cloudAgents === "enabled"` assertion at `bkit-modules.integration.test.ts:~703-710` is extended to assert `bkit.cloud` too; manifest is split per DECISION-D so uninstall removes ONLY the recorded variant's files (test asserts `uninstall` of a `cloud=claude` install does not orphan `.cursor/*` and vice-versa).
- [ ] **T1.6:** Add symmetric tracker/cloud constraint + tracker-switch hard-block (`--force`) in `.agents/scripts/bkit-install.ts`.
  - **Done when:** `--cloud=claude` on `tracker=linear` hard-errors (and vice versa); switching a recorded tracker without `--force` hard-errors; first-set is free; `--force` overrides; tests assert each.
- [ ] **T1.7:** Flip the `bkit-cloud-setup` advisory App optional→required; delete the `github.token`-only line; update `mentionTipLine`; migrate the bare `Auto` advisory strings (`bkit-modules.ts:2051/2054/2055`) → `bkit:auto` (or remove with the `isLinearCloud` branch if T1.5's split deletes it); flip `cloud.md` matrix (line 23) + path E (line 30) + Post-CI section.
  - **Done when:** advisory action contains `/install-github-app` + "required" and no `github.token`-handles-everything text; `grep -n '\bAuto\b' .agents/scripts/bkit-modules.ts` returns no advisory-label references (only `bkit:auto`); `cloud.md` describes the App as base requirement; `bkit-modules.integration.test.ts` advisory asserts updated (including the `bkit:auto` advisory text) and green.
- [ ] **T1.8:** Add `bkit check` `cloud=claude` config-consistency assertion (workflow `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced) in the install/check post-install path.
  - **Done when:** `bkit check` exits 1 when `bkit.cloud=claude` but `bkit-cloud.yml` lacks `id-token`; integration/doctor test covers it.
- [ ] **T1.10:** Reconcile `bkit-postinstall.ts` cloud advisories with the GitHub-only `bkit-cloud.yml` + cloud-split (R3-3): drop the `tracker==="linear"` → `LINEAR_API_KEY`-in-`bkit-cloud.yml` coupling in `buildCloudSetupAdvisory` (:803), `buildCloudDashboardsAdvisory` (:849), `buildCloudSecretsAdvisory` (:895); `bkit-cloud.yml`-related advisory text becomes `cloud=claude`/`github`-only.
  - **Done when:** none of the three builders associate `LINEAR_API_KEY` with `bkit-cloud.yml`; `grep -n 'LINEAR_API_KEY' .agents/scripts/bkit-postinstall.ts` shows it only on the `cloud=cursor`/`tracker=linear` (`.cursor`) path, never the `bkit-cloud.yml` secret set; a `bkit-modules.integration.test.ts` (or postinstall-advisory) test asserts the GitHub-only secret set for `cloud=claude` and no `bkit-cloud.yml`+`LINEAR_API_KEY` advisory for `tracker=linear`.
- [ ] **T1.9:** Regenerate `.agents/advisories.md` (end of session, single regen).
  - **Done when:** `.agents/advisories.md` reflects the updated `bkit-cloud-setup` advisory; `bkit check` reports no advisories drift.

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
  - **Done when:** `bkit-cloud.md` no longer owns the YAML-ceded gates; `bkit-cloud.yml` performs them; orchestrator retains Step 4 routing + status + comments; the `bkit:auto` label-removal propagation is either re-homed into the YAML kill-switch branch (verifiable in `bkit-cloud.yml`) OR explicitly documented as dropped in the plan/orchestrator with the consumer-manual-cleanup note — NOT silently lost.
- [ ] **T2.7:** Implement the two-tier CI gate in `bkit-cloud.yml` + template: free-tier `if: contains(...head_commit.message, 'bkit [auto route]')`; SHARED-DERIV `{ISSUE}` derivation step (branch `feat/{FID}` → FID → issue; fail-safe no-op on underivable FID); in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` → no-op exit if absent; then dispatch `/bkit-cloud {ship|debug} {PR}`. Wrap in `bkit:start`/`bkit:end`.
  - **Done when:** (a) NEGATIVE — YAML review confirms job skips without the marker (zero runner minutes) and exits no-op when `bkit:auto` is absent; (b) POSITIVE — a render/grep assertion (or fixture-driven YAML review) demonstrates that when the marked close-workflow commit IS the `workflow_run.head_commit` (`bkit [auto route]` present) AND `bkit:auto` is present, the gate evaluates true and reaches the `/bkit-cloud {ship|debug} {PR}` dispatch step — closing the marker→HEAD→job-fires chain, not just the skip; (c) the `{ISSUE}` value used by the kill switch is produced by the SHARED-DERIV step (same FID expression as T3.1's concurrency key — assert one shared derivation, not two); (d) gate logic is inside `bkit:start`/`bkit:end`; (e) canonical + template byte-match for `tracker=github`.

### Block 3 — D3 concurrency key

- [ ] **T3.1:** Reconcile the `concurrency.group` key (line 64) to one FID-derived token across dispatch + CI surfaces in `bkit-cloud.yml` + template, reusing the **same SHARED-DERIV FID** as T2.7's kill switch (do NOT introduce a second derivation).
  - **Done when:** dispatched and CI-completion runs for the same FID resolve to the same `concurrency.group` (`bkit-cloud-<FID>`); the FID expression is the SHARED-DERIV one also consumed by T2.7's `gh issue view` (single derivation, asserted reused — not duplicated); render test asserts a single FID-derived expression; `cancel-in-progress: true` retained.

### Block 4 — `@claude` / `claude.yml` wiring + `Auto`→`bkit:auto`

- [ ] **T4.1:** Verify/wire `@claude /bkit-<phase>` dispatch as the App in `.github/workflows/claude.yml` (bkit-repo-only, DECISION-B); confirm the typed command is the phase carrier and bare assignment is not. Do NOT ship a `claude.yml` template; do NOT migrate its auth (DECISION-A).
  - **Done when:** `grep -n 'claude_code_oauth_token' .github/workflows/claude.yml` still returns line ~37 AND `grep -n 'id-token: write' .github/workflows/claude.yml` returns line ~25 (auth unchanged per DECISION-A — no `ANTHROPIC_API_KEY` introduced here); `claude.yml` `if:`/prompt wiring passes `@claude /bkit-<phase>` typed command through to `claude-code-action`; the `assigned` trigger (line 9) carries no phase; `Glob **/claude.yml` returns ONLY `.github/workflows/claude.yml` (no template shipped); the `bkit-cloud-setup` advisory (T1.7) directs consumers to `/install-github-app` for their own `claude.yml`.
- [ ] **T4.2:** Migrate bare `Auto` → `bkit:auto` in `.agents/templates/.claude/hooks/preflight.sh` (lines 8, 109-111) and `.agents/templates/.cursor/hooks/preflight.sh` (lines 8, 96-98).
  - **Done when:** `grep -rn '\bAuto\b' .agents/templates/.claude/hooks/preflight.sh .agents/templates/.cursor/hooks/preflight.sh` returns no label references; substring match is `,bkit:auto,`; rendered-file test (real tool path) passes.
- [ ] **T4.3:** Confirm `.agents/trackers.md` has no remaining bare `Auto`; optionally rename the `bkit:auto` label description.
  - **Done when:** `grep -n '\bAuto\b' .agents/trackers.md` returns no label references; description rename applied if folded in.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every task above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy:** bkit uses Vitest (`.agents/scripts/*.test.ts` + `*.integration.test.ts`). Validate shipped config with the real tool/resolver, never string-presence-only (repo memory: #179/#195 class). Verify install AND upgrade live, not just `bkit check`. Dogfood via packed tarball in a clean dir if dependency classification could shift. No per-edit `bkit install` — batch mirror regen at session end.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every matrix row has a corresponding task/test. Add tasks for any uncovered row (note: the two-tier GHA `if:` and the commit-tag workflow changes have no executable unit harness — cover via YAML/doc review + render-assertion where possible).
- [ ] **Update existing tests (named):** `bkit-modules.integration.test.ts` — advisory asserts (679-701, incl. `bkit:auto` not `Auto`), `bkit.cloudAgents` assertion (~703-710, add `bkit.cloud`), `renderCloudWorkflow` Linear-keep tests (754-762 + 787-793 deleted/replaced), `linear: omits install-github-app` (~695-700 restructured under cloud-split); `bkit-cli.test.ts` (--cloud=value + invalid + --force); `bkit-dry-run-parity.integration.test.ts` (cloud=cursor); manifest tests (variant split); `bkit-postinstall.ts` advisory test (T1.10).
- [ ] **Write new tests:** tracker/cloud constraint, tracker-switch hard-block, `bkit check` consistency, preflight `bkit:auto` render.
- [ ] **Update documentation:** `cloud.md`, `deployments.md`, `decisions.md`, `knowledge.md`, regenerate `.agents/advisories.md`.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + ESLint clean across `.agents/scripts/`.
- [ ] **Render parity:** `renderCloudWorkflow(template, "github")` byte-equals the canonical `.github/workflows/bkit-cloud.yml`; install AND upgrade produce identical output (no drift fight).
- [ ] **Vitest:** `pnpm test` green — `bkit-modules.integration.test.ts`, `bkit-cli.test.ts`, `bkit-dry-run-parity.integration.test.ts`, `bkit-doctor.integration.test.ts`, manifest suite.
- [ ] **Live install/upgrade dogfood:** run `bkit install --cloud=claude` and `bkit install --cloud=cursor` on a clean fixture (and `bkit upgrade`) — confirm correct files, `bkit.cloud` recorded, tracker constraint enforced, `bkit check` consistency passes. (Verify install AND upgrade live, per repo memory.)

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
- [ ] **(9)** #184 shared HEAD-subject assertion owns the commit-tag contract; build/debug/ship invoke it; it treats `bkit [auto route]` as legitimate. (Workflow review; coordinate with #184.)
- [ ] **(10)** design/plan/build + manual ship/debug launch via `@claude /bkit-<phase>`; auto ship/debug via the gated CI route. **Consumer coverage rides on `/install-github-app` (App-generated `claude.yml`) + the `bkit-cloud-setup` advisory — bkit ships NO `claude.yml` template (DECISION-B); this repo's `claude.yml` is dogfood-only.** Auth surfaces differ by design (DECISION-A: `claude.yml` = `claude_code_oauth_token`, `bkit-cloud.yml` = `ANTHROPIC_API_KEY`+OIDC). (`claude.yml` review bkit-repo-only + advisory review + post-merge live confirmation.)
- [ ] **(11)** Linear `Auto` → `bkit:auto` migrated across preflight hooks + tracker snippets **AND `bkit-modules.ts` advisory strings (`:2051/2054/2055`)** — no bare `Auto` survives in any shipped/advisory text. (grep + render test.)
- [ ] **(12)** Vestigial Linear branch removed from `renderCloudWorkflow`; `bkit-cloud.yml` is GitHub-only. (Vitest + grep.)
- [ ] **(13)** Tests updated/green (advisory asserts, render, dry-run parity, manifest). (Gate 4.)
