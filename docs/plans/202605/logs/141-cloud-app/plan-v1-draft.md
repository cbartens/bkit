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

- A live dispatch reaches a Claude turn: `claude-code-action@v1` authenticates as the Claude App via OIDC (`id-token: write` + App installed), gated by a coherent two-tier CI route and a single FID-derived concurrency key.
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

A bkit consumer on a GitHub-tracker repo runs `bkit install --cloud=claude`, installs the Claude GitHub App once, and labels an issue `bkit:auto`. From then on, `@claude /bkit-<phase>` comments launch design/plan/build (and manual ship/debug) as the App, while a green/red CI run auto-routes to ship/debug — but only for commits carrying `bkit [auto route]` and only while the linked issue still carries `bkit:auto`, with no runner minutes burned otherwise.

### Success Criteria

- `claude-code-action@v1` authenticates as the Claude App (`id-token: write` granted + App installed); a live dispatch reaches a Claude turn (standing runtime-verification item, human-gated post-merge).
- `cloud=claude` requires `tracker=github`; `cloud=cursor` requires `tracker=linear`; mismatch hard-errors symmetrically; first tracker-set is free, switching an established tracker hard-blocks without `--force` — all from `package.json` recorded state.
- CI auto-route fires only for commits carrying `bkit [auto route]` (zero runner minutes otherwise) and only while the linked issue still carries `bkit:auto` (live kill switch).
- `worktree-setup` / `create-pr` commits carry `bkit [skip ci]`; only the close-workflow commit (and the debug re-trigger commit) are loud and carry `bkit [auto route]`; #184's shared HEAD-subject assertion owns the contract and treats `bkit [auto route]` as legitimate.
- Linear bare `Auto` is migrated to `bkit:auto` across preflight hooks + tracker snippets; `bkit-cloud.yml` is GitHub-only (vestigial Linear render branch removed); all tests green.

### Concrete Example

**Setup:** A consumer repo with `bkit.issueTracker = "github"`. Maintainer runs `bkit install --cloud=claude`, sets the `ANTHROPIC_API_KEY` repo secret, and runs `/install-github-app` once. Issue #50 carries `bkit:auto`.

**Steps:**

1. Maintainer comments `@claude /bkit-build 50` on issue #50 → `claude.yml` fires, `claude-code-action@v1` authenticates as the App via OIDC, runs `/bkit-build 50` → bkit-build runs, pushing `chore(50-…): worktree-setup bkit [skip ci]` and `chore(50-…): create-pr bkit [skip ci]` (no CI fired by these), then a loud `chore(50-…): close-workflow … bkit [auto route]` as the trailing HEAD.
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
| `bkit-cloud-setup` advisory states App + `/install-github-app` required (optional→required); `github.token`-only framing deleted | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit check` asserts `cloud=claude` config consistency (workflow has `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` / doctor test |
| Two-tier CI gate: job skipped without `bkit [auto route]`; in-job `bkit:auto` re-check kill switch | Manual/YAML review (no unit harness for GHA `if:`) | `.github/workflows/bkit-cloud.yml` + template |
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
> - New `package.json` field: `bkit.cloud` (`"claude" | "cursor"`) recording the cloud variant — distinct from the existing `bkit.cloudAgents` ("enabled"/"none") presence signal. Confirm the field name: proposal is `bkit.cloud`; FINAL SCOPE decision 4 calls it the "new cloud-variant field". Reuse `bkit.cloudAgents` only if the human prefers a single field.
> - New commit marker: `bkit [auto route]` (literal, `bkit` outside the brackets, direction-neutral; mirrors `bkit [skip ci]`).
> - New workflow grant: `id-token: write` in `bkit-cloud.yml`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

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
| `bkit-cloud.yml:22-25` "`github.token` handles all repo git/gh; no App" rationale (canonical + template) | App-auth framing (`id-token: write` + App required) | DELETE | FINAL SCOPE decision 1: delete the framing; commits/PRs/comments appear as the App. |
| `bkit-modules.ts:2075` "Do NOT add `GH_BKIT_TOKEN` … github.token" advisory line | App-required advisory text | DELETE | Same as above; advisory must state App + `/install-github-app` required (decision 2). |
| Bare `Auto` label in `.agents/templates/.claude/hooks/preflight.sh:8,109-111` + `.agents/templates/.cursor/hooks/preflight.sh:8,96-98` | `bkit:auto` | DELETE | Label convention: `bkit:` prefix on every tracker (FINAL SCOPE Labels row; migrate bare `Auto`). |
| Bare `--cloud` flag (value-less) `.agents/scripts/bkit-cli.ts` | `--cloud=claude\ | cursor` value-bearing flag | DELETE | FINAL SCOPE decision 3: explicit variant, tracker-constrained. |

> [!CAUTION]
> Each `DELETE` row is mirrored in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook`.

## Security & Privacy

> bkit is a tooling repo, not the app-gether-life app — the template's API-route/RLS/Zod rows do not apply. Relevant rows:

- [x] **Webhook / event trigger** — `bkit-cloud.yml` `workflow_run` and `claude.yml` `issue_comment` are GitHub-native events; the two-tier gate (`bkit [auto route]` marker + in-job `bkit:auto` re-check) is the trust boundary. No raw webhook secret to verify (GitHub signs events).
- [x] **New secret/env var** — `ANTHROPIC_API_KEY` (existing) is the only required secret; `id-token: write` is an OIDC grant, not a stored secret. No new stored secret. `GH_BKIT_TOKEN` must NOT be added to `bkit-cloud.yml` (package-install scoped, no consumer-repo access).
- [x] **Auth model** — `claude-code-action@v1` authenticates as the Claude App via OIDC (federated, no long-lived token). Confirm `permissions:` block grants `id-token: write` and no broader scope than needed.

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
- Delete the "`github.token` handles all repo git/gh access … no App" framing (lines 22-25 of the comment header).
- Reconcile the `concurrency:` key (line 64) to a single FID-derived token across dispatch + CI surfaces (D3 — see Block 3).
- Add the two-tier CI auto-route gate (Block 2): free-tier job `if: contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')` + in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto`. Wrap the YAML gate logic inside `bkit:start`/`bkit:end` markers (Comment 7 gate-placement rule).
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

#### [MODIFY] generated `.agents/advisories.md`

- **Existence Check:** Regenerated from advisory definitions. Regenerate after the `bkit-cloud-setup` advisory edits (do NOT hand-edit; defer regen to end-of-session per repo memory — no per-edit `bkit install`).

#### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts` + `bkit-cli.test.ts` + `bkit-dry-run-parity.integration.test.ts`

- Update advisory asserts (lines 679-701: `bkit-cloud-setup` action now asserts App-required + `/install-github-app`; remove `github.token` expectation). Update `renderCloudWorkflow` tests (lines 765-794) to drop the Linear-branch cases and assert `id-token: write` + GitHub-only. Add cloud=claude/cursor variant + tracker-constraint + tracker-switch tests. Add `cloud=cursor` dry-run parity.

### Block 2 — #184 shared assertion → D2 skip-tags + `bkit [auto route]` marker → two-tier CI gate

#### [NEW] Shared HEAD-subject assertion snippet (#184)

- A single bkit-managed snippet asserting: HEAD of any push to a CI-validated ref has no `bkit [skip ci]`; PR title is clean; and `bkit [auto route]` is a **legitimate** HEAD token (NOT a skip tag). This becomes the SoT for the commit-tag contract documented in `docs/deployments.md` § "CI trigger on final workflow push" (lines 309-321). Land per #184's chosen home (workflow snippet referenced by build/debug/ship close-workflow + PR-create steps). **Coordinate exact shape with #184.**

#### [MODIFY] `.agents/workflows/bkit-build.md`

- **Existence Check:** Exists.
- Line 260 `chore({FID}): worktree-setup` → add `bkit [skip ci]` (D2). (deployments.md:321 already _claims_ this commit is skip-tagged — the workflow currently is not; this fixes the divergence.)
- Line 915 `chore({FID}): create-pr` → add `bkit [skip ci]` (D2).
- Line 947 close-workflow commit → add `bkit [auto route]` marker, **only when** the issue carried `bkit:auto` at close time (the kill-switch re-read at lines 963-970 already establishes `bkit:auto` presence — reuse it). Keep it loud (no `[skip ci]`).
- Replace any inline re-derivation of the HEAD-clean rule with an invocation of the #184 shared assertion (Gate 18 line 984 "HEAD on remote does NOT contain `bkit [skip ci]`").

#### [MODIFY] `.agents/workflows/bkit-debug.md`

- **Existence Check:** Exists.
- The debug re-trigger commit (create-pr at line 844 / close path) must stay **loud** AND carry `bkit [auto route]` — only when the issue carried `bkit:auto` at close time (kill-switch re-read lines 863-870). Load-bearing: the marked commit must be HEAD at CI time.
- Invoke the #184 shared assertion at Gate 12 (line 887 "HEAD on remote does NOT contain `bkit [skip ci]`") instead of re-deriving.

#### [MODIFY] `.agents/workflows/bkit-ship.md`

- **Existence Check:** Exists (Gate references `HEAD on remote does NOT contain bkit [skip ci]` at line 424).
- Invoke the #184 shared assertion instead of the inline rule.

#### [MODIFY] `.agents/workflows/bkit-cloud.md` (orchestrator)

- **Existence Check:** Exists.
- Per Comment 7 gate-placement: the opt-in gate (Step 3, lines 185-230) + stale guard (Step 2, lines 143-181) MOVE INTO the YAML job (`bkit-cloud.yml`). Phase routing (Step 4) + `status.json` + comments STAY in the orchestrator. Update the orchestrator to drop the gates it cedes to YAML, keep routing/status/comments.

#### [MODIFY] `.github/workflows/bkit-cloud.yml` + template (two-tier gate)

- Add free-tier job `if:` on `bkit [auto route]` + in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` (cheap-tier live kill switch); on absence → no-op exit. Then dispatch `/bkit-cloud {ship|debug} {PR}`. Wrap gate logic in `bkit:start`/`bkit:end` markers.

### Block 3 — D3 concurrency key

#### [MODIFY] `.github/workflows/bkit-cloud.yml` + template

- Line 64 `group: bkit-cloud-${{ inputs.issue || github.event.workflow_run.head_branch }}` resolves dispatched (`bkit-cloud-<issue>`) and CI-completion (`bkit-cloud-feat/<branch>`) runs to _different_ groups. Reconcile to **one FID-derived token** computed identically across both surfaces (e.g. derive FID from `inputs.issue` and from `head_branch` → same `bkit-cloud-<FID>` group). `cancel-in-progress: true` then serialises a dispatched build against the auto-ship it triggers.

### Block 4 — `@claude` / `claude.yml` trigger wiring + `Auto`→`bkit:auto` migration

#### [MODIFY] `.github/workflows/claude.yml`

- **Existence Check:** Exists (already has `id-token: write` at line 25, uses `claude_code_oauth_token`).
- Wire `@claude /bkit-<phase>` dispatch as the App: `issue_comment` is the primary surface (lines 3-5). Ensure the typed command (`/bkit-design|plan|build|ship|debug`) is the phase carrier and is passed through to `claude-code-action`. Confirm auth model coherence with `bkit-cloud.yml` (both authenticate as the App). Confirm bare issue assignment (line 9 `assigned`) does NOT carry a phase (out of scope as a trigger).
- If `claude.yml` is bkit-shipped to consumers, ensure the template variant matches (verify whether a template copy exists; this repo's `.github/workflows/claude.yml` is the live one).

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
| `.agents/cloud.md` | App = base requirement (matrix line 23, path E line 30); rewrite § Post-CI auto-routing for App-auth + two-tier `bkit [auto route]` gate; `--cloud=claude\ | cursor`; remove `github.token`-only framing (lines 367, 369). |
| `.agents/trackers.md` | Confirm `bkit:auto` consistency post-hook-migration; optional label-description rename (lines 78, 196). |
| `docs/deployments.md` | § "CI trigger on final workflow push" (lines 309-321): document `bkit [auto route]` as a loud HEAD token (not a skip tag), worktree-setup/create-pr now carry `[skip ci]`, the two-tier CI auto-route gate, and point the contract at #184's shared assertion. |
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
  - **Done when:** template `permissions:` block contains `id-token: write`; lines 22-25 framing removed; `grep -n "github.token handles" .agents/templates/.github/workflows/bkit-cloud.yml` returns nothing.
- [ ] **T1.2:** Remove the `renderCloudWorkflow` Linear branch in `.agents/scripts/bkit-modules.ts` (GitHub-only render; `id-token: write` present in output).
  - **Done when:** `renderCloudWorkflow` has no `isLinear` substitution; `bkit-modules.integration.test.ts` Linear-branch cases removed/replaced; rendered output for `tracker=github` contains `id-token: write` and no `@@CLOUD_TRACKER`.
- [ ] **T1.3:** Regenerate `.github/workflows/bkit-cloud.yml` (this repo's rendered copy) to match the new template for `tracker=github`.
  - **Done when:** `.github/workflows/bkit-cloud.yml` has `id-token: write`, no Linear/`github.token` framing; byte-identical to `renderCloudWorkflow(template, "github")`.
- [ ] **T1.4:** Add value-bearing `--cloud=claude|cursor` parsing (reject bare `--cloud` + invalid values) and `--force` install-context parsing in `.agents/scripts/bkit-cli.ts`; update `printUsage`.
  - **Done when:** `bkit install --cloud` (bare) errors; `--cloud=claude`/`--cloud=cursor` parse to the variant; `bkit-cli.test.ts` covers both + invalid value; help shows `--cloud=claude|cursor`.
- [ ] **T1.5:** Split `runCloudModule` by variant + add `bkit.cloud` field; update `MODULE_REGISTRY`/`MODULE_DISPATCH_ORDER` + `bkit-manifest.ts` so `cloud=claude` ships `bkit-cloud.yml`+`cloud-bootstrap.sh` and `cloud=cursor` ships `.cursor/Dockerfile`+`environment.json`.
  - **Done when:** integration test shows `--cloud=claude` writes `bkit-cloud.yml` (not `.cursor/Dockerfile`) and `--cloud=cursor` writes `.cursor/Dockerfile`+`environment.json` (not `bkit-cloud.yml`); `package.json` `bkit.cloud` recorded; uninstall removes the variant's files.
- [ ] **T1.6:** Add symmetric tracker/cloud constraint + tracker-switch hard-block (`--force`) in `.agents/scripts/bkit-install.ts`.
  - **Done when:** `--cloud=claude` on `tracker=linear` hard-errors (and vice versa); switching a recorded tracker without `--force` hard-errors; first-set is free; `--force` overrides; tests assert each.
- [ ] **T1.7:** Flip the `bkit-cloud-setup` advisory App optional→required; delete the `github.token`-only line; update `mentionTipLine`; flip `cloud.md` matrix (line 23) + path E (line 30) + Post-CI section.
  - **Done when:** advisory action contains `/install-github-app` + "required" and no `github.token`-handles-everything text; `cloud.md` describes the App as base requirement; `bkit-modules.integration.test.ts` advisory asserts updated and green.
- [ ] **T1.8:** Add `bkit check` `cloud=claude` config-consistency assertion (workflow `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced) in the install/check post-install path.
  - **Done when:** `bkit check` exits 1 when `bkit.cloud=claude` but `bkit-cloud.yml` lacks `id-token`; integration/doctor test covers it.
- [ ] **T1.9:** Regenerate `.agents/advisories.md` (end of session, single regen).
  - **Done when:** `.agents/advisories.md` reflects the updated `bkit-cloud-setup` advisory; `bkit check` reports no advisories drift.

### Block 2 — #184 shared assertion → D2 skip-tags + `bkit [auto route]` marker → two-tier CI gate

- [ ] **T2.1:** Land #184's single shared HEAD-subject assertion snippet (coordinate exact shape with #184) treating `bkit [auto route]` as a legitimate HEAD token.
  - **Done when:** the assertion exists in its bkit-managed home; asserts HEAD has no `bkit [skip ci]`, PR title clean, `bkit [auto route]` allowed; referenced (not re-derived) by build/debug/ship.
- [ ] **T2.2:** Add `bkit [skip ci]` to `worktree-setup` (`bkit-build.md:260`) and `create-pr` (`bkit-build.md:915`) commits (D2).
  - **Done when:** both commit-message lines include `bkit [skip ci]`; matches the contract in `deployments.md:321`.
- [ ] **T2.3:** Add `bkit [auto route]` to the build close-workflow commit (`bkit-build.md:947`), only when the issue carried `bkit:auto` at close time; keep it loud.
  - **Done when:** close-workflow commit carries `bkit [auto route]` conditionally on `bkit:auto`, no `[skip ci]`; Gate 18 invokes the #184 assertion.
- [ ] **T2.4:** Make the debug re-trigger commit loud AND carry `bkit [auto route]` (conditional on `bkit:auto`) in `bkit-debug.md`; invoke the #184 assertion at Gate 12.
  - **Done when:** debug re-trigger commit carries `bkit [auto route]` conditionally, no `[skip ci]`; Gate 12 references the #184 assertion.
- [ ] **T2.5:** Invoke the #184 assertion in `bkit-ship.md` (Gate at line 424) instead of the inline rule.
  - **Done when:** ship Gate references the #184 assertion; no inline re-derivation remains.
- [ ] **T2.6:** Move the opt-in gate + stale guard from `bkit-cloud.md` (Steps 2-3) INTO `bkit-cloud.yml`; keep routing/status/comments in the orchestrator.
  - **Done when:** `bkit-cloud.md` no longer owns the YAML-ceded gates; `bkit-cloud.yml` performs them; orchestrator retains Step 4 routing + status + comments.
- [ ] **T2.7:** Implement the two-tier CI gate in `bkit-cloud.yml` + template: free-tier `if: contains(...head_commit.message, 'bkit [auto route]')`; in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` → no-op exit if absent; then dispatch `/bkit-cloud {ship|debug} {PR}`. Wrap in `bkit:start`/`bkit:end`.
  - **Done when:** YAML review confirms job skips without the marker (zero runner minutes) and exits no-op when `bkit:auto` is gone; gate logic is inside `bkit:start`/`bkit:end`; canonical + template byte-match for `tracker=github`.

### Block 3 — D3 concurrency key

- [ ] **T3.1:** Reconcile the `concurrency.group` key (line 64) to one FID-derived token across dispatch + CI surfaces in `bkit-cloud.yml` + template.
  - **Done when:** dispatched and CI-completion runs for the same FID resolve to the same `concurrency.group`; render test asserts a single FID-derived expression; `cancel-in-progress: true` retained.

### Block 4 — `@claude` / `claude.yml` wiring + `Auto`→`bkit:auto`

- [ ] **T4.1:** Wire `@claude /bkit-<phase>` dispatch as the App in `.github/workflows/claude.yml`; confirm the typed command is the phase carrier and bare assignment is not.
  - **Done when:** `claude.yml` routes `@claude /bkit-<phase>` to `claude-code-action` as the App; assignment carries no phase; auth model coherent with `bkit-cloud.yml`.
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
- [ ] **Update existing tests:** `bkit-modules.integration.test.ts` (advisory + renderCloudWorkflow), `bkit-cli.test.ts` (--cloud=value + --force), `bkit-dry-run-parity.integration.test.ts` (cloud=cursor), manifest tests.
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
- [ ] **(10)** design/plan/build + manual ship/debug launch via `@claude /bkit-<phase>`; auto ship/debug via the gated CI route. (`claude.yml` review + post-merge live confirmation.)
- [ ] **(11)** Linear `Auto` → `bkit:auto` migrated across preflight hooks + tracker snippets. (grep + render test.)
- [ ] **(12)** Vestigial Linear branch removed from `renderCloudWorkflow`; `bkit-cloud.yml` is GitHub-only. (Vitest + grep.)
- [ ] **(13)** Tests updated/green (advisory asserts, render, dry-run parity, manifest). (Gate 4.)
